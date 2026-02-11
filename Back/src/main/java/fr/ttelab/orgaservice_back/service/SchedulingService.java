package fr.ttelab.orgaservice_back.service;

import fr.ttelab.orgaservice_back.entity.CalendarEvent;
import fr.ttelab.orgaservice_back.entity.User;
import fr.ttelab.orgaservice_back.entity.WorkDay;
import fr.ttelab.orgaservice_back.repository.CalendarEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

/**
 * Service pour calculer les créneaux disponibles pour planifier des événements.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SchedulingService {

  private final static Integer PAUSE_MINIMUM_TIME_MINUTE = 15;
  private final CalendarEventRepository calendarEventRepository;

  public LocalDateTime calculateProposedDateTime(User user, YearMonth yearMonth,
                                                  int durationMinutes, int index, int totalInMonth) {
    LocalDate startDate = calculateStartDate(yearMonth);
    LocalDate endDate = yearMonth.atEndOfMonth();

    if (endDate.isBefore(startDate)) {
      return null;
    }

    List<CalendarEvent> existingEvents = calendarEventRepository.findFiltered(
        user, null, startDate.atStartOfDay(), endDate.atTime(23, 59, 59));

    List<TimeSlot> availableSlots = calculateAvailableSlots(user, startDate, endDate,
        durationMinutes, existingEvents);

    if (availableSlots.isEmpty()) {
      return null;
    }

    return selectSlotForIndex(availableSlots, index, totalInMonth);
  }

  private LocalDate calculateStartDate(YearMonth yearMonth) {
    LocalDate today = LocalDate.now();
    LocalDate firstOfMonth = yearMonth.atDay(1);

    if (yearMonth.equals(YearMonth.from(today))) {
      LocalDate tomorrow = today.plusDays(1);
      return tomorrow.isAfter(firstOfMonth) ? tomorrow : firstOfMonth;
    }
    return firstOfMonth;
  }

  private List<TimeSlot> calculateAvailableSlots(User user, LocalDate startDate, LocalDate endDate,
                                                  int durationMinutes, List<CalendarEvent> existingEvents) {
    List<TimeSlot> slots = new ArrayList<>();
    Set<WorkDay> workDays = user.getWorkDays();
    LocalTime workStart = user.getWorkStartTime();
    LocalTime workEnd = user.getWorkEndTime();

    LocalDate currentDate = startDate;
    while (!currentDate.isAfter(endDate)) {
      if (isWorkDay(currentDate, workDays)) {
        slots.addAll(calculateDaySlots(currentDate, workStart, workEnd, durationMinutes, existingEvents));
      }
      currentDate = currentDate.plusDays(1);
    }
    return slots;
  }

  private boolean isWorkDay(LocalDate date, Set<WorkDay> workDays) {
    DayOfWeek dayOfWeek = date.getDayOfWeek();
    return workDays.stream().anyMatch(wd -> wd.getDayOfWeek() == dayOfWeek);
  }

  private List<TimeSlot> calculateDaySlots(LocalDate date, LocalTime workStart, LocalTime workEnd,
                                            int durationMinutes, List<CalendarEvent> existingEvents) {
    List<TimeSlot> slots = new ArrayList<>();

    List<CalendarEvent> dayEvents = existingEvents.stream()
        .filter(e -> e.getDateTime() != null && e.getDateTime().toLocalDate().equals(date))
        .sorted(Comparator.comparing(CalendarEvent::getDateTime))
        .toList();

    LocalTime currentStart = workStart;

    for (CalendarEvent event : dayEvents) {
      LocalTime eventStart = event.getDateTime().toLocalTime();
      LocalTime eventEnd = eventStart.plusMinutes(event.getDuration() != null ? event.getDuration() : 60);

      if (currentStart.plusMinutes(durationMinutes).compareTo(eventStart) <= 0 &&
          currentStart.plusMinutes(durationMinutes).compareTo(workEnd) <= 0) {
        slots.add(new TimeSlot(date.atTime(currentStart), durationMinutes));
      }

      if (eventEnd.isAfter(currentStart)) {
        currentStart = eventEnd.plusMinutes(PAUSE_MINIMUM_TIME_MINUTE);
      }
    }

    if (currentStart.plusMinutes(durationMinutes).compareTo(workEnd) <= 0) {
      slots.add(new TimeSlot(date.atTime(currentStart), durationMinutes));
    }

    return slots;
  }

  private LocalDateTime selectSlotForIndex(List<TimeSlot> slots, int index, int total) {
    if (slots.isEmpty()) return null;
    if (total <= 1) return slots.get(0).startDateTime;

    int slotIndex = (int) Math.round((double) index * (slots.size() - 1) / (total - 1));
    slotIndex = Math.min(slotIndex, slots.size() - 1);
    return slots.get(slotIndex).startDateTime;
  }

  private static class TimeSlot {
    final LocalDateTime startDateTime;
    final int durationMinutes;
    TimeSlot(LocalDateTime startDateTime, int durationMinutes) {
      this.startDateTime = startDateTime;
      this.durationMinutes = durationMinutes;
    }
  }
}

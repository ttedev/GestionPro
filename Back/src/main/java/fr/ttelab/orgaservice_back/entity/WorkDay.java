package fr.ttelab.orgaservice_back.entity;

import java.time.DayOfWeek;

/**
 * Enum représentant les jours de travail possibles.
 */
public enum WorkDay {
  MONDAY(DayOfWeek.MONDAY),
  TUESDAY(DayOfWeek.TUESDAY),
  WEDNESDAY(DayOfWeek.WEDNESDAY),
  THURSDAY(DayOfWeek.THURSDAY),
  FRIDAY(DayOfWeek.FRIDAY),
  SATURDAY(DayOfWeek.SATURDAY),
  SUNDAY(DayOfWeek.SUNDAY);

  private final DayOfWeek dayOfWeek;

  WorkDay(DayOfWeek dayOfWeek) {
    this.dayOfWeek = dayOfWeek;
  }

  public DayOfWeek getDayOfWeek() {
    return dayOfWeek;
  }

  public static WorkDay fromDayOfWeek(DayOfWeek dayOfWeek) {
    for (WorkDay workDay : values()) {
      if (workDay.dayOfWeek == dayOfWeek) {
        return workDay;
      }
    }
    throw new IllegalArgumentException("No WorkDay for " + dayOfWeek);
  }
}


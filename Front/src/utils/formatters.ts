/**
 * Utilitaires de formatage pour l'affichage
 */

/**
 * Formate un numéro de téléphone pour l'affichage
 * Groupe les chiffres deux par deux avec des espaces
 * @param phone - Le numéro de téléphone à formater
 * @returns Le numéro formaté (ex: "06 12 34 56 78")
 */
export function formatPhone(phone: string): string {
  // Supprimer tous les espaces et caractères non numériques
  const cleaned = phone.replace(/\D/g, '');
  // Grouper par 2 chiffres
  return cleaned.match(/.{1,2}/g)?.join(' ') || phone;
}

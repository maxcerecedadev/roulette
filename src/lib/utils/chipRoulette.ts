// src/lib/utils/chipRoulette.ts

/**
 * Retorna la URL de la imagen del chip según el monto total de la apuesta.
 * @param totalBet El monto total de la apuesta.
 * @returns La ruta de la imagen del chip.
 */
export const getChipImageSrc = (totalBet: number): string => {
  if (totalBet >= 1000) {
    return "/res/ChipOrange.svg";
  } else if (totalBet >= 500) {
    return "/res/ChipBlueDark.svg";
  } else if (totalBet >= 200) {
    return "/res/ChipRed.svg";
  } else if (totalBet >= 100) {
    return "/res/ChipGreen.svg";
  } else {
    return "/res/ChipBlueLight.svg";
  }
};

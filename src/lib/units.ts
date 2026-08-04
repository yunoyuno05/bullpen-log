import { useAppStore } from './store';

export const convertSpeed = (kmh: number, unit: 'kmh' | 'mph'): number => {
  if (unit === 'mph') {
    return Math.round(kmh / 1.60934);
  }
  return kmh;
};

export const convertWeight = (kg: number, unit: 'kg' | 'lbs'): number => {
  if (unit === 'lbs') {
    return Math.round(kg * 2.20462);
  }
  return kg;
};

export const useUnits = () => {
  const speedUnit = useAppStore(state => state.speedUnit);
  const weightUnit = useAppStore(state => state.weightUnit);

  const formatSpeed = (kmh: number) => {
    return `${convertSpeed(kmh, speedUnit)} ${speedUnit === 'mph' ? 'mph' : 'km/h'}`;
  };

  const formatWeight = (kg: number) => {
    return `${convertWeight(kg, weightUnit)} ${weightUnit === 'lbs' ? 'lbs' : 'kg'}`;
  };

  return { speedUnit, weightUnit, formatSpeed, formatWeight, convertSpeed, convertWeight };
};

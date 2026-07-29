'use client';

import { useState } from 'react';

export function useScope2FormState(defaultUnit: string) {
  const [efSource, setEfSource] = useState('');
  const [factorVersion, setFactorVersion] = useState('');
  const [fuelOrGasType, setFuelOrGasType] = useState('');
  const [energyAmount, setEnergyAmount] = useState('');
  const [unit, setUnit] = useState(defaultUnit);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [facility, setFacility] = useState('');
  const [comment, setComment] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('Approved');

  return {
    efSource,
    setEfSource,
    factorVersion,
    setFactorVersion,
    fuelOrGasType,
    setFuelOrGasType,
    energyAmount,
    setEnergyAmount,
    unit,
    setUnit,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    facility,
    setFacility,
    comment,
    setComment,
    approvalStatus,
    setApprovalStatus,
  };
}

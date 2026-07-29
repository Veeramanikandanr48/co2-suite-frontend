'use client';

import { useState, useRef } from 'react';

export function useScope1FormState() {
  const [efSource, setEfSource] = useState('');
  const [factorVersion, setFactorVersion] = useState('');
  const [fuelOrGasType, setFuelOrGasType] = useState('');
  const [fugitiveType, setFugitiveType] = useState<'filling' | 'leakage'>('filling');
  const [leakagePercent, setLeakagePercent] = useState('');
  const [amount, setAmount] = useState('');
  const [inventoryName, setInventoryName] = useState('');
  const [dataAcquisitionMethod, setDataAcquisitionMethod] = useState('');
  const [facility, setFacility] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [comment, setComment] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return {
    efSource,
    setEfSource,
    factorVersion,
    setFactorVersion,
    fuelOrGasType,
    setFuelOrGasType,
    fugitiveType,
    setFugitiveType,
    leakagePercent,
    setLeakagePercent,
    amount,
    setAmount,
    inventoryName,
    setInventoryName,
    dataAcquisitionMethod,
    setDataAcquisitionMethod,
    facility,
    setFacility,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    comment,
    setComment,
    approvalStatus,
    setApprovalStatus,
    proofFile,
    setProofFile,
    fileInputRef,
  };
}

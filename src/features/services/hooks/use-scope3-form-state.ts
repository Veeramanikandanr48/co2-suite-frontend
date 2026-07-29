'use client';

import { useState, useRef } from 'react';

export function useScope3FormState() {
  const [efSource, setEfSource] = useState('');
  const [factorVersion, setFactorVersion] = useState('');
  const [materialProduct, setMaterialProduct] = useState('');
  const [activityOption, setActivityOption] = useState('');
  const [typeOption, setTypeOption] = useState('');
  const [sizeOption, setSizeOption] = useState('');
  const [distance, setDistance] = useState('');
  const [amount, setAmount] = useState('');
  const [travelOption, setTravelOption] = useState('');
  const [peopleCount, setPeopleCount] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [sourceOption, setSourceOption] = useState('');
  const [wasteType, setWasteType] = useState('');
  const [treatmentOption, setTreatmentOption] = useState('');
  const [country, setCountry] = useState('');
  const [inventoryName, setInventoryName] = useState('');
  const [dataAcquisitionMethod, setDataAcquisitionMethod] = useState('');
  const [investeeScope1, setInvesteeScope1] = useState('');
  const [investeeScope2, setInvesteeScope2] = useState('');
  const [equityShare, setEquityShare] = useState('');
  const [facility, setFacility] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [comment, setComment] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('Approved');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return {
    efSource,
    setEfSource,
    factorVersion,
    setFactorVersion,
    materialProduct,
    setMaterialProduct,
    activityOption,
    setActivityOption,
    typeOption,
    setTypeOption,
    sizeOption,
    setSizeOption,
    distance,
    setDistance,
    amount,
    setAmount,
    travelOption,
    setTravelOption,
    peopleCount,
    setPeopleCount,
    fuelType,
    setFuelType,
    sourceOption,
    setSourceOption,
    wasteType,
    setWasteType,
    treatmentOption,
    setTreatmentOption,
    country,
    setCountry,
    inventoryName,
    setInventoryName,
    dataAcquisitionMethod,
    setDataAcquisitionMethod,
    investeeScope1,
    setInvesteeScope1,
    investeeScope2,
    setInvesteeScope2,
    equityShare,
    setEquityShare,
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

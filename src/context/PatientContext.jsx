import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PATIENTS } from '../data/mockData';

const PatientContext = createContext();

export const PatientProvider = ({ children }) => {
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem('pharmalink_pk_patients');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved patients', e);
      }
    }
    return INITIAL_PATIENTS;
  });

  const [activePatientForPOS, setActivePatientForPOS] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('pharmalink_pk_patients', JSON.stringify(patients));
    } catch (e) {
      console.error('Failed to save patients to localStorage', e);
    }
  }, [patients]);

  const addPatient = (patientData) => {
    if (!patientData || !patientData.name) return null;

    const todayStr = new Date().toISOString().split('T')[0];
    const newPatient = {
      id: patientData.id || `PAT-${Date.now().toString().slice(-4)}`,
      name: patientData.name,
      age: patientData.age || '',
      phone: patientData.phone || '',
      prescribingDoctor: patientData.prescribingDoctor || '',
      address: patientData.address || '',
      lastVisit: todayStr,
      totalSpend: patientData.totalSpend || 0,
    };

    setPatients((prev) => [newPatient, ...prev]);
    return newPatient;
  };

  const servePatientInPOS = (patient) => {
    setActivePatientForPOS(patient);
  };

  const clearActivePatientForPOS = () => {
    setActivePatientForPOS(null);
  };

  return (
    <PatientContext.Provider
      value={{
        patients,
        activePatientForPOS,
        addPatient,
        servePatientInPOS,
        clearActivePatientForPOS,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};

export default PatientContext;

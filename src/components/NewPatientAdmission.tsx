import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';

interface PatientData {
  mrn: string;
  patient_name: string;
  age: number;
  gender: string;
  admission_date: string;
  admission_time: string;
  assigned_doctor: string;
  specialty: string;
}

const specialtiesList = [
  'General Internal Medicine',
  'Respiratory Medicine',
  'Infectious Diseases',
  'Neurology',
  'Gastroenterology',
  'Rheumatology',
  'Hematology',
  'Thrombosis Medicine',
  'Immunology & Allergy'
];

const NewPatientAdmission: React.FC = () => {
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState<PatientData>({
    mrn: '',
    patient_name: '',
    age: 0,
    gender: '',
    admission_date: '',
    admission_time: '',
    assigned_doctor: '',
    specialty: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPatientData({ ...patientData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Insert into patients table
      const { data: patientInsert, error: patientError } = await supabase
        .from('patients')
        .insert([patientData]);

      if (patientError) throw patientError;

      // Insert into visits table
      const { data: visitInsert, error: visitError } = await supabase
        .from('visits')
        .insert([{
          mrn: patientData.mrn,
          admission_date: `${patientData.admission_date}T${patientData.admission_time}`,
          specialty: patientData.specialty,
          patient_status: 'Active'
        }]);

      if (visitError) throw visitError;

      toast.success('Patient admitted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to admit patient');
      console.error('Error:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">New Patient Admission</h1>
      <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
        <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
          <div className="space-y-6 sm:space-y-5">
            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="mrn" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                MRN
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input
                  type="text"
                  name="mrn"
                  id="mrn"
                  value={patientData.mrn}
                  onChange={handleInputChange}
                  required
                  className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="patient_name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Patient Name
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input
                  type="text"
                  name="patient_name"
                  id="patient_name"
                  value={patientData.patient_name}
                  onChange={handleInputChange}
                  required
                  className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Age
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input
                  type="number"
                  name="age"
                  id="age"
                  value={patientData.age}
                  onChange={handleInputChange}
                  required
                  className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Gender
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <select
                  id="gender"
                  name="gender"
                  value={patientData.gender}
                  onChange={handleInputChange}
                  required
                  className="max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="admission_date" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Admission Date
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input
                  type="date"
                  name="admission_date"
                  id="admission_date"
                  value={patientData.admission_date}
                  onChange={handleInputChange}
                  required
                  className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="admission_time" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Admission Time
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input
                  type="time"
                  name="admission_time"
                  id="admission_time"
                  value={patientData.admission_time}
                  onChange={handleInputChange}
                  required
                  className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="assigned_doctor" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Assigned Doctor
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input
                  type="text"
                  name="assigned_doctor"
                  id="assigned_doctor"
                  value={patientData.assigned_doctor}
                  onChange={handleInputChange}
                  required
                  className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Specialty
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <select
                  id="specialty"
                  name="specialty"
                  value={patientData.specialty}
                  onChange={handleInputChange}
                  required
                  className="max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select specialty</option>
                  {specialtiesList.map((specialty) => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Admit Patient
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewPatientAdmission;
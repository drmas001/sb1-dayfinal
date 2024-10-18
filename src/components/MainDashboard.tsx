import React, { useState, useEffect } from 'react';
import { Users, Activity, Clipboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

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

interface SpecialtyData {
  name: string;
  count: number;
}

const MainDashboard: React.FC = () => {
  const [patientCount, setPatientCount] = useState<number>(0);
  const [specialties, setSpecialties] = useState<SpecialtyData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch total active patient count
      const { count: totalCount, error: countError } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .eq('patient_status', 'Active');

      if (countError) throw countError;
      setPatientCount(totalCount || 0);

      // Fetch patient count for each specialty
      const specialtyCounts = await Promise.all(
        specialtiesList.map(async (specialty) => {
          const { count, error } = await supabase
            .from('visits')
            .select('*', { count: 'exact', head: true })
            .eq('specialty', specialty)
            .eq('patient_status', 'Active');

          if (error) throw error;
          return { name: specialty, count: count || 0 };
        })
      );

      setSpecialties(specialtyCounts);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Main Dashboard</h1>
      
      <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Active Patients
                </dt>
                <dd className="text-3xl font-semibold text-gray-900">
                  {patientCount}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">
            Specialty Statistics
          </h2>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            {specialties.map((specialty, index) => (
              <div key={specialty.name} className={index % 2 === 0 ? 'bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6' : 'bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'}>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-indigo-500" />
                  {specialty.name}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {specialty.count} active patients
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Link to="/daily-report" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <Clipboard className="h-5 w-5 mr-2" />
          View Daily Report
        </Link>
      </div>
    </div>
  );
};

export default MainDashboard;
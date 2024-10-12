/* eslint-disable prettier/prettier */

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEthernet, faHdd, faMemory, faMicrochip } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import getServerResourceUsage, { ServerStats } from '@/api/server/getServerResourceUsage';
import Spinner from '@/components/elements/Spinner';

const Card = styled.div`
  ${tw`bg-neutral-950 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl`};
  ${tw`max-w-full md:max-w-2xl lg:max-w-4xl mx-auto`}; /* Responsive width */
`;

const Header = styled.div`
  ${tw`p-6 relative`}
  background-image: url('https://th.bing.com/th/id/R.a92a7ad9d55335ee500b6997e735d4dd?rik=98mn0ERXGWCpjA&pid=ImgRaw&r=0');
  background-size: cover;
  background-position: center;
  color: white;
  border-radius: 0.5rem 0.5rem 0 0;
`;

const Title = styled.h2`
  ${tw`text-2xl font-bold mb-2`};
`;

const Description = styled.p`
  ${tw`text-sm mb-4`};
`;

const InfoSection = styled.div`
  ${tw`space-y-2 p-6`}; /* Keeps items stacked with space between them */
`;

const InfoItem = styled.div`
  ${tw`flex items-center text-white mb-2`}; /* Ensure stacking by margin-bottom */
`;

const InfoIcon = styled(FontAwesomeIcon)`
  ${tw`w-5 h-5 mr-2`};
`;

const Footer = styled.div`
  ${tw`bg-neutral-950 p-4 flex justify-between`};
`;

const ManageButton = styled(Link)`
  ${tw`bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition duration-300`};
`;

const ServerRow = ({ server }: { server: any }) => {
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServerStats = async () => {
      try {
        const data = await getServerResourceUsage(server.uuid);
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchServerStats();

    // Polling for updated stats every 30 seconds
    const intervalId = setInterval(fetchServerStats, 30000);
    return () => clearInterval(intervalId);
  }, [server.uuid]);

  return (
    <Card>
      <Header>
        <Title>{server.name}</Title>
        <Description>{server.description || 'Join the discord server if anything happens!'}</Description>
      </Header>
      {loading ? (
        <div css={tw`flex justify-center py-6`}>
          <Spinner />
        </div>
      ) : (
        <InfoSection>
          <InfoItem>
            <InfoIcon icon={faMicrochip} />
            <span>
              <strong>CPU Usage:</strong> {stats ? `${stats.cpuUsagePercent.toFixed(2)}%` : 'N/A'}
            </span>
          </InfoItem>
          <InfoItem>
            <InfoIcon icon={faMemory} />
            <span>
              <strong>Memory Usage:</strong> {stats ? `${(stats.memoryUsageInBytes / (1024 * 1024)).toFixed(2)} MB` : 'N/A'}
            </span>
          </InfoItem>
          <InfoItem>
            <InfoIcon icon={faHdd} />
            <span>
              <strong>Disk Usage:</strong> {stats ? `${(stats.diskUsageInBytes / (1024 * 1024)).toFixed(2)} MB` : 'N/A'}
            </span>
          </InfoItem>
          <InfoItem>
            <InfoIcon icon={faEthernet} />
            <span>
              <strong>IP Address:</strong>{' '}
              {server.allocations
                .filter((alloc: any) => alloc.isDefault)
                .map((allocation: any) => `${allocation.alias || allocation.ip}:${allocation.port}`)
                .join(', ')}
            </span>
          </InfoItem>
        </InfoSection>
      )}
      <Footer>
        <ManageButton to={`/server/${server.id}`}>Manage Server</ManageButton>
      </Footer>
    </Card>
  );
};

export default ServerRow;

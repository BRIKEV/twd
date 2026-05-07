import React from 'react';
import { useLoaderData,  } from 'react-router';
import type { contactsLoader } from '../loaders/contactsLoader';
import Pagination from '../components/Pagination';

const Contacts: React.FC = () => {
  const { contacts, currentPage, totalPages } = useLoaderData<typeof contactsLoader>();


  const getPageHref = (page: number) => `/contacts?page=${page}`;

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '32px 20px',
        background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
      }}
    >
      <div
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 18px 45px rgba(15, 23, 42, 0.10)',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <p
            style={{
              margin: 0,
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#2563eb',
            }}
          >
            Agenda mock
          </p>
          <h1
            style={{
              margin: '8px 0 6px',
              fontSize: '32px',
              color: '#0f172a',
            }}
          >
            Contactos
          </h1>
          <p style={{ margin: 0, color: '#475569', fontSize: '15px' }}>
            Una lista simple de contactos con nombre y correo.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '14px' }}>
          {contacts.length === 0 ? (
            <div
              style={{
                padding: '22px',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px dashed #cbd5e1',
                color: '#64748b',
                textAlign: 'center',
              }}
            >
              No hay contactos disponibles.
            </div>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 18px',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '17px',
                      fontWeight: 600,
                      color: '#0f172a',
                    }}
                  >
                    {contact.name}
                  </p>
                  <p
                    style={{
                      margin: '6px 0 0',
                      fontSize: '14px',
                      color: '#64748b',
                    }}
                  >
                    {contact.email}
                  </p>
                </div>

                <span
                  style={{
                    padding: '6px 10px',
                    borderRadius: '999px',
                    backgroundColor: '#dbeafe',
                    color: '#1d4ed8',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  Contacto
                </span>
              </div>
            ))
          )}
        </div>

       

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          getPageHref={getPageHref}
        />
      </div>
    </div>
  );
};

export default Contacts;

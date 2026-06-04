import React from 'react';
import { Link } from 'react-router';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  getPageHref: (page: number) => string;
};

const buttonBaseStyle: React.CSSProperties = {
  minWidth: '38px',
  height: '38px',
  padding: '0 12px',
  borderRadius: '10px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#ffffff',
  color: '#334155',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  getPageHref,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginTop: '22px',
        flexWrap: 'wrap',
      }}
    >
      <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
        Pagina {currentPage} de {totalPages}
      </p>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Link
          to={getPageHref(Math.max(currentPage - 1, 1))}
          aria-disabled={currentPage === 1}
          style={{
            ...buttonBaseStyle,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            opacity: currentPage === 1 ? 0.5 : 1,
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            pointerEvents: currentPage === 1 ? 'none' : 'auto',
          }}
        >
          Anterior
        </Link>

        {pages.map((page) => (
          <Link
            key={page}
            to={getPageHref(page)}
            style={{
              ...buttonBaseStyle,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              backgroundColor: currentPage === page ? '#2563eb' : '#ffffff',
              borderColor: currentPage === page ? '#2563eb' : '#cbd5e1',
              color: currentPage === page ? '#ffffff' : '#334155',
            }}
          >
            {page}
          </Link>
        ))}

        <Link
          to={getPageHref(Math.min(currentPage + 1, totalPages))}
          aria-disabled={currentPage === totalPages}
          style={{
            ...buttonBaseStyle,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            opacity: currentPage === totalPages ? 0.5 : 1,
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            pointerEvents: currentPage === totalPages ? 'none' : 'auto',
          }}
        >
          Siguiente
        </Link>
      </div>
    </div>
  );
};

export default Pagination;

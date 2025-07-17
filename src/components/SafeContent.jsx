"use client";

import { memo } from 'react';

/**
 * Componente para sanitizar contenido dinámico y prevenir XSS
 * @param {Object} props - Propiedades del componente
 * @param {string} props.content - Contenido a sanitizar
 * @param {string} props.as - Elemento HTML a renderizar (default: 'span')
 * @param {Object} props.className - Clases CSS
 * @returns {JSX.Element} - Elemento con contenido sanitizado
 */
const SafeContent = memo(function SafeContent({ 
  content, 
  as: Element = 'span',
  className = '',
  ...props 
}) {
  // Sanitizar contenido
  const sanitize = (text) => {
    if (!text) return '';
    
    // Convertir a string si no lo es
    const str = String(text);
    
    // Escapar caracteres especiales
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  // Sanitizar contenido
  const sanitizedContent = sanitize(content);
  
  return (
    <Element 
      className={className} 
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      {...props}
    />
  );
});

export default SafeContent;
import React, { useRef, useState, useEffect } from 'react';
import { useFoundation } from '../context/FoundationContext';
import { KontenWeb } from '../types';

interface EditableTextProps {
  contentKey: keyof KontenWeb;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'p' | 'span' | 'div';
  className?: string;
  multiline?: boolean;
  prefix?: string;
}

export const EditableText: React.FC<EditableTextProps> = ({
  contentKey,
  as: Component = 'span',
  className = '',
  multiline = false,
  prefix = ''
}) => {
  const { kontenWeb, directEditMode, adminSession, updateDirectField } = useFoundation();
  let value = (kontenWeb[contentKey] as string) || '';
  if (contentKey === 'brand_sub' && value.toUpperCase().includes('PROVINSI')) {
    value = value.replace(/PROVINSI\s*/gi, '').trim();
  }
  const ref = useRef<HTMLDivElement>(null);
  const [localVal, setLocalVal] = useState(value);

  useEffect(() => {
    let clean = value;
    if (contentKey === 'brand_sub' && clean.toUpperCase().includes('PROVINSI')) {
      clean = clean.replace(/PROVINSI\s*/gi, '').trim();
    }
    setLocalVal(clean);
  }, [value, contentKey]);

  const canEdit = Boolean(adminSession && directEditMode);

  const handleBlur = () => {
    if (!canEdit || !ref.current) return;
    const currentText = ref.current.innerText.trim();
    if (currentText !== value) {
      updateDirectField(contentKey, currentText);
    }
  };

  const handleInput = () => {
    if (!canEdit || !ref.current) return;
    const currentText = ref.current.innerText;
    setLocalVal(currentText);
    updateDirectField(contentKey, currentText);
  };

  if (!canEdit) {
    if (multiline) {
      return (
        <Component className={className}>
          {prefix}{value}
        </Component>
      );
    }
    return (
      <Component className={className}>
        {prefix}{value}
      </Component>
    );
  }

  return (
    <Component
      ref={ref as any}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onInput={handleInput}
      className={`${className} admin-editable-active cursor-text transition-all`}
      title="✏️ Klik untuk mengedit teks ini langsung (Mode Edit Aktif)"
    >
      {localVal}
    </Component>
  );
};

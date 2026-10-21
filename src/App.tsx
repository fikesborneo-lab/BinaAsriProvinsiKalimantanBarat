/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FoundationProvider, useFoundation } from './context/FoundationContext';
import { TopBar } from './components/TopBar';
import { HeaderNavbar } from './components/HeaderNavbar';
import { HeroSection } from './components/HeroSection';
import { StatsSection } from './components/StatsSection';
import { ProfilSection } from './components/ProfilSection';
import { ProgramSection } from './components/ProgramSection';
import { BeritaSection } from './components/BeritaSection';
import { GaleriSection } from './components/GaleriSection';
import { PengurusSection } from './components/PengurusSection';
import { DonasiSection } from './components/DonasiSection';
import { KontakSection } from './components/KontakSection';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ToastContainer } from './components/ToastContainer';
import { AdminLiveToolbar } from './components/AdminLiveToolbar';
import { AdminDashboard } from './components/AdminDashboard';
import { BeritaReaderModal } from './components/modals/BeritaReaderModal';
import { GaleriLightboxModal } from './components/modals/GaleriLightboxModal';
import { AdminLoginModal } from './components/modals/AdminLoginModal';
import {
  BeritaFormModal,
  ProgramFormModal,
  GaleriFormModal,
  PengurusFormModal,
  BankFormModal,
  QuickEditSectionModal
} from './components/modals/CrudModals';
import { AiBeritaGeneratorModal } from './components/modals/AiBeritaGeneratorModal';
import { DeployGuideModal } from './components/modals/DeployGuideModal';
import { TbcScreeningModal } from './components/modals/TbcScreeningModal';
import { BeritaItem, ProgramItem, GaleriItem, PengurusItem, BankAccount } from './types';

const MainApplication: React.FC = () => {
  const { activeView, adminSession, saveAllDirectChanges, unsavedKeys } = useFoundation();

  // Modals state
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [readBerita, setReadBerita] = useState<BeritaItem | null>(null);
  const [lightboxGaleri, setLightboxGaleri] = useState<GaleriItem | null>(null);

  // CRUD Form modals
  const [beritaModal, setBeritaModal] = useState<{ isOpen: boolean; item: BeritaItem | null }>({
    isOpen: false,
    item: null
  });

  const [programModal, setProgramModal] = useState<{ isOpen: boolean; item: ProgramItem | null }>({
    isOpen: false,
    item: null
  });

  const [galeriModalOpen, setGaleriModalOpen] = useState(false);

  const [pengurusModal, setPengurusModal] = useState<{
    isOpen: boolean;
    item: PengurusItem | null;
    defaultCabang?: string;
  }>({
    isOpen: false,
    item: null,
    defaultCabang: 'Kota Pontianak'
  });

  const [bankModal, setBankModal] = useState<{ isOpen: boolean; item: BankAccount | null }>({
    isOpen: false,
    item: null
  });

  // Section quick edit modal
  const [quickModal, setQuickModal] = useState<{
    type: 'hero' | 'profil' | 'stats' | 'donasi' | 'kontak' | 'footer' | 'sectionHeader' | null;
    sectionPrefix?: 'program' | 'berita' | 'galeri' | 'pengurus';
  }>({ type: null });

  // Dedicated AI, Deploy Guide, and TB screening modal states
  const [aiBeritaOpen, setAiBeritaOpen] = useState(false);
  const [deployGuideOpen, setDeployGuideOpen] = useState(false);
  const [tbcScreeningOpen, setTbcScreeningOpen] = useState(false);

  // Keyboard shortcut Ctrl+S / Cmd+S to save inline changes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        if (adminSession && unsavedKeys.length > 0) {
          e.preventDefault();
          saveAllDirectChanges();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [adminSession, unsavedKeys, saveAllDirectChanges]);

  // If in dashboard view, show fullscreen Admin Dashboard
  if (activeView === 'dashboard' && adminSession) {
    return (
      <>
        <AdminDashboard
          onOpenAddBerita={() => setBeritaModal({ isOpen: true, item: null })}
          onOpenEditBerita={(item) => setBeritaModal({ isOpen: true, item })}
          onOpenAddProgram={() => setProgramModal({ isOpen: true, item: null })}
          onOpenEditProgram={(item) => setProgramModal({ isOpen: true, item })}
          onOpenAddGaleri={() => setGaleriModalOpen(true)}
          onOpenAddPengurus={(defaultCabang) => setPengurusModal({ isOpen: true, item: null, defaultCabang })}
          onOpenEditPengurus={(item) => setPengurusModal({ isOpen: true, item, defaultCabang: item.cabang })}
          onOpenAddBank={() => setBankModal({ isOpen: true, item: null })}
          onOpenEditBank={(item) => setBankModal({ isOpen: true, item })}
          onOpenAiBerita={() => setAiBeritaOpen(true)}
          onOpenDeployGuide={() => setDeployGuideOpen(true)}
        />

        {/* Re-usable CRUD Modals inside Dashboard */}
        <BeritaFormModal
          isOpen={beritaModal.isOpen}
          item={beritaModal.item}
          onClose={() => setBeritaModal({ isOpen: false, item: null })}
        />

        <AiBeritaGeneratorModal
          isOpen={aiBeritaOpen}
          onClose={() => setAiBeritaOpen(false)}
          onApplyToForm={(generated) => {
            setBeritaModal({ isOpen: true, item: generated as any });
          }}
        />

        <DeployGuideModal
          isOpen={deployGuideOpen}
          onClose={() => setDeployGuideOpen(false)}
        />

        <ProgramFormModal
          isOpen={programModal.isOpen}
          item={programModal.item}
          onClose={() => setProgramModal({ isOpen: false, item: null })}
        />

        <GaleriFormModal
          isOpen={galeriModalOpen}
          onClose={() => setGaleriModalOpen(false)}
        />

        <PengurusFormModal
          isOpen={pengurusModal.isOpen}
          item={pengurusModal.item}
          defaultCabang={pengurusModal.defaultCabang}
          onClose={() => setPengurusModal({ isOpen: false, item: null, defaultCabang: undefined })}
        />

        <BankFormModal
          isOpen={bankModal.isOpen}
          item={bankModal.item}
          onClose={() => setBankModal({ isOpen: false, item: null })}
        />

        <ToastContainer />
      </>
    );
  }

  // Public Website View
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-emerald-200 selection:text-emerald-900">
      {/* Live Admin Sticky Toolbar */}
      <AdminLiveToolbar
        onOpenAddBerita={() => setBeritaModal({ isOpen: true, item: null })}
        onOpenAddProgram={() => setProgramModal({ isOpen: true, item: null })}
        onOpenAddGaleri={() => setGaleriModalOpen(true)}
        onOpenAddPengurus={() => setPengurusModal({ isOpen: true, item: null })}
        onOpenAddBank={() => setBankModal({ isOpen: true, item: null })}
        onOpenAiBerita={() => setAiBeritaOpen(true)}
        onOpenDeployGuide={() => setDeployGuideOpen(true)}
      />

      {/* Top Bar with Contact Info */}
      <TopBar
        onOpenAdminLogin={() => setLoginModalOpen(true)}
        onOpenEditKontak={() => setQuickModal({ type: 'kontak' })}
      />

      {/* Main Navbar */}
      <HeaderNavbar
        onOpenAdminLogin={() => setLoginModalOpen(true)}
        onOpenTbcScreening={() => setTbcScreeningOpen(true)}
      />

      {/* Hero Banner */}
      <HeroSection
        onOpenEditHero={() => setQuickModal({ type: 'hero' })}
        onOpenAdminLogin={() => setLoginModalOpen(true)}
        onOpenTbcScreening={() => setTbcScreeningOpen(true)}
      />

      {/* Impact Stats */}
      <StatsSection
        onOpenEditStatistik={() => setQuickModal({ type: 'stats' })}
      />

      {/* About Foundation & Mission */}
      <ProfilSection
        onOpenEditProfil={() => setQuickModal({ type: 'profil' })}
      />

      {/* Program Kerja */}
      <ProgramSection
        onOpenAddProgram={() => setProgramModal({ isOpen: true, item: null })}
        onOpenEditProgram={(item) => setProgramModal({ isOpen: true, item })}
        onOpenEditSectionHeader={(prefix) => setQuickModal({ type: 'sectionHeader', sectionPrefix: prefix })}
        onOpenTbcScreening={() => setTbcScreeningOpen(true)}
      />

      {/* News & Updates */}
      <BeritaSection
        onOpenAddBerita={() => setBeritaModal({ isOpen: true, item: null })}
        onOpenEditBerita={(item) => setBeritaModal({ isOpen: true, item })}
        onOpenReadBerita={(item) => setReadBerita(item)}
        onOpenEditSectionHeader={(prefix) => setQuickModal({ type: 'sectionHeader', sectionPrefix: prefix })}
      />

      {/* Photo Documentation Gallery */}
      <GaleriSection
        onOpenAddGaleri={() => setGaleriModalOpen(true)}
        onOpenLightbox={(item) => setLightboxGaleri(item)}
        onOpenEditSectionHeader={(prefix) => setQuickModal({ type: 'sectionHeader', sectionPrefix: prefix })}
      />

      {/* Board & Leadership */}
      <PengurusSection
        onOpenAddPengurus={(defaultCabang) => setPengurusModal({ isOpen: true, item: null, defaultCabang })}
        onOpenEditPengurus={(item) => setPengurusModal({ isOpen: true, item, defaultCabang: item.cabang })}
        onOpenEditSectionHeader={(prefix) => setQuickModal({ type: 'sectionHeader', sectionPrefix: prefix })}
      />

      {/* Infaq & Official Bank Accounts */}
      <DonasiSection
        onOpenAddBank={() => setBankModal({ isOpen: true, item: null })}
        onOpenEditBank={(item) => setBankModal({ isOpen: true, item })}
        onOpenEditDonasi={() => setQuickModal({ type: 'donasi' })}
      />

      {/* Contact & Inquiry Message Form */}
      <KontakSection
        onOpenEditKontak={() => setQuickModal({ type: 'kontak' })}
      />

      {/* Footer */}
      <Footer
        onOpenAdminLogin={() => setLoginModalOpen(true)}
        onOpenEditFooter={() => setQuickModal({ type: 'footer' })}
      />

      {/* WhatsApp Floating Contact */}
      <FloatingWhatsApp />

      {/* Reader & Lightbox Modals */}
      <BeritaReaderModal
        berita={readBerita}
        onClose={() => setReadBerita(null)}
      />

      <GaleriLightboxModal
        item={lightboxGaleri}
        onClose={() => setLightboxGaleri(null)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      {/* CRUD Form Modals */}
      <BeritaFormModal
        isOpen={beritaModal.isOpen}
        item={beritaModal.item}
        onClose={() => setBeritaModal({ isOpen: false, item: null })}
      />

      <ProgramFormModal
        isOpen={programModal.isOpen}
        item={programModal.item}
        onClose={() => setProgramModal({ isOpen: false, item: null })}
      />

      <GaleriFormModal
        isOpen={galeriModalOpen}
        onClose={() => setGaleriModalOpen(false)}
      />

      <PengurusFormModal
        isOpen={pengurusModal.isOpen}
        item={pengurusModal.item}
        defaultCabang={pengurusModal.defaultCabang}
        onClose={() => setPengurusModal({ isOpen: false, item: null, defaultCabang: undefined })}
      />

      <BankFormModal
        isOpen={bankModal.isOpen}
        item={bankModal.item}
        onClose={() => setBankModal({ isOpen: false, item: null })}
      />

      <QuickEditSectionModal
        type={quickModal.type}
        sectionPrefix={quickModal.sectionPrefix}
        onClose={() => setQuickModal({ type: null })}
      />

      {/* AI News Generator Modal */}
      <AiBeritaGeneratorModal
        isOpen={aiBeritaOpen}
        onClose={() => setAiBeritaOpen(false)}
        onApplyToForm={(generated) => {
          setBeritaModal({ isOpen: true, item: generated as any });
        }}
      />

      {/* Deploy to GitHub & Vercel Guide Modal */}
      <DeployGuideModal
        isOpen={deployGuideOpen}
        onClose={() => setDeployGuideOpen(false)}
      />

      {/* TOSS TBC Self Screening Modal */}
      <TbcScreeningModal
        isOpen={tbcScreeningOpen}
        onClose={() => setTbcScreeningOpen(false)}
      />

      {/* Global Toast Alerts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <FoundationProvider>
      <MainApplication />
    </FoundationProvider>
  );
}

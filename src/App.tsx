import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from './components/ui/toaster';
import { CookieBanner } from './components/CookieBanner';

import { Home } from './pages/Home';
import { NotreHistoire } from './pages/NotreHistoire';
import { NotrePromesse } from './pages/NotrePromesse';
import { Experience } from './pages/Experience';
import { ArtDeLaRencontre } from './pages/ArtDeLaRencontre';
import { CertificationGentleman } from './pages/CertificationGentleman';
import { Coaching } from './pages/Coaching';
import { Temoignages } from './pages/Temoignages';
import { Confidentialite } from './pages/Confidentialite';
import { Contact } from './pages/Contact';
import { Evenements } from './pages/Evenements';
import { EvenementDetail } from './pages/EvenementDetail';
import { DevenirMembre } from './pages/DevenirMembre';
import { Connexion } from './pages/Connexion';
import { MentionsLegales } from './pages/MentionsLegales';
import { ConditionsGenerales } from './pages/ConditionsGenerales';

import { MembresLayout } from './pages/members/MembresLayout';
import { Profil } from './pages/members/Profil';
import { MesEvenements } from './pages/members/MesEvenements';
import { Abonnement } from './pages/members/Abonnement';
import MesBillets from './pages/members/MesBillets';

import ReserverEvenement from './pages/ReserverEvenement';
import Paiement from './pages/Paiement';
import TestPaiement from './pages/TestPaiement';
import { Boutique } from './pages/Boutique';
import { PaiementProduit } from './pages/PaiementProduit';

import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminEvenements } from './pages/admin/AdminEvenements';
import { AdminMembres } from './pages/admin/AdminMembres';
import { AdminPaiements } from './pages/admin/AdminPaiements';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/notre-histoire" element={<Layout><NotreHistoire /></Layout>} />
          <Route path="/notre-promesse" element={<Layout><NotrePromesse /></Layout>} />
          <Route path="/experience" element={<Layout><Experience /></Layout>} />
          <Route path="/art-de-la-rencontre" element={<Layout><ArtDeLaRencontre /></Layout>} />
          <Route path="/certification-gentleman" element={<Layout><CertificationGentleman /></Layout>} />
          <Route path="/coaching" element={<Layout><Coaching /></Layout>} />
          <Route path="/temoignages" element={<Layout><Temoignages /></Layout>} />
          <Route path="/confidentialite" element={<Layout><Confidentialite /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/evenements" element={<Layout><Evenements /></Layout>} />
          <Route path="/evenements/:slug" element={<Layout><EvenementDetail /></Layout>} />
          <Route path="/evenements/:slug/reserver" element={<Layout><ReserverEvenement /></Layout>} />
          <Route path="/paiement/:orderId" element={<Layout><Paiement /></Layout>} />
          <Route path="/test-paiement" element={<Layout><TestPaiement /></Layout>} />
          <Route path="/boutique" element={<Layout><Boutique /></Layout>} />
          <Route path="/paiement-produit/:orderId" element={<Layout><PaiementProduit /></Layout>} />
          <Route path="/devenir-membre" element={<Layout><DevenirMembre /></Layout>} />
          <Route path="/connexion" element={<Layout><Connexion /></Layout>} />
          <Route path="/mentions-legales" element={<Layout><MentionsLegales /></Layout>} />
          <Route path="/conditions-generales" element={<Layout><ConditionsGenerales /></Layout>} />

          <Route
            path="/membres"
            element={
              <ProtectedRoute>
                <Layout><MembresLayout /></Layout>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/membres/profil" replace />} />
            <Route path="profil" element={<Profil />} />
            <Route path="mes-evenements" element={<MesEvenements />} />
            <Route path="mes-billets" element={<MesBillets />} />
            <Route path="abonnement" element={<Abonnement />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <Layout><AdminLayout /></Layout>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="evenements" element={<AdminEvenements />} />
            <Route path="membres" element={<AdminMembres />} />
            <Route path="paiements" element={<AdminPaiements />} />
            <Route path="temoignages" element={<div className="py-12 text-center text-black/60">Section témoignages à venir</div>} />
            <Route path="messages" element={<div className="py-12 text-center text-black/60">Section messages à venir</div>} />
          </Route>

          <Route path="*" element={<Layout><div className="py-24 px-4 text-center"><h1 className="text-4xl font-light mb-4">Page non trouvée</h1><p className="text-black/60">La page que vous recherchez n'existe pas.</p></div></Layout>} />
        </Routes>
        <Toaster />
        <CookieBanner />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

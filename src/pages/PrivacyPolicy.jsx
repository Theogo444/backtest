// ============================================================================
//  PrivacyPolicy.jsx — politique de confidentialité (/confidentialite).
//  Base RGPD minimale, à compléter par l'éditeur (identité + contact réels).
//  ⚠️ TODO(éditeur) : remplacer les [À COMPLÉTER] avant mise en avant publique.
// ============================================================================

import { Head } from 'vite-react-ssg'

const UPDATED = '28 juin 2026'

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Politique de confidentialité | Simulateur de Portefeuille FR</title>
        <meta
          name="description"
          content="Comment Simulateur de Portefeuille FR collecte et utilise vos données (email). Vos droits RGPD et comment les exercer."
        />
        <link rel="canonical" href="https://simulateur-portefeuille.fr/confidentialite" />
      </Head>

      <article className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-extrabold text-navy-800 dark:text-white md:text-4xl">
          Politique de confidentialité
        </h1>
        <p className="mt-2 text-sm text-navy-400">Dernière mise à jour : {UPDATED}</p>

        <div className="article-body mt-6">
          <h2>Responsable du traitement</h2>
          <p>
            Le présent site « Simulateur de Portefeuille FR » est édité par{' '}
            <strong>[À COMPLÉTER : nom de l'éditeur]</strong>. Pour toute question relative à vos
            données, contactez <strong>[À COMPLÉTER : email de contact]</strong>.
          </p>

          <h2>Données collectées</h2>
          <p>
            Les simulations se déroulent intégralement dans votre navigateur : aucune donnée de
            simulation n'est envoyée à un serveur. La seule donnée personnelle que nous collectons est
            votre <strong>adresse email</strong>, et uniquement si vous la saisissez volontairement
            dans l'un de nos formulaires pour recevoir une ressource ou nos conseils.
          </p>

          <h2>Finalité et base légale</h2>
          <p>
            Votre email est utilisé pour vous envoyer la ressource demandée (par exemple « le
            comparatif PEA 2026 ») puis des conseils et informations sur l'investissement. La base
            légale est votre <strong>consentement</strong>, donné au moment de l'inscription. Vous
            pouvez le retirer à tout moment.
          </p>

          <h2>Durée de conservation</h2>
          <p>
            Votre email est conservé tant que vous restez inscrit, puis supprimé dans un délai
            raisonnable après votre désinscription.
          </p>

          <h2>Vos droits</h2>
          <p>
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de
            limitation et d'opposition concernant vos données. Vous pouvez vous désinscrire en un clic
            via le lien présent dans chaque email, ou exercer vos droits en écrivant à l'adresse de
            contact ci-dessus. Vous pouvez également introduire une réclamation auprès de la CNIL.
          </p>

          <h2>Cookies et mesure d'audience</h2>
          <p>
            Le site peut utiliser des cookies de mesure d'audience et, le cas échéant, des emplacements
            publicitaires. Ces outils ne sont activés qu'avec votre accord lorsque la réglementation
            l'exige. <strong>[À COMPLÉTER : préciser les outils réellement utilisés — Google
            Analytics, AdSense, etc. — une fois activés.]</strong>
          </p>

          <h2>Prestataire d'emailing</h2>
          <p>
            L'envoi de nos emails pourra être confié à un prestataire spécialisé (par exemple Brevo,
            MailerLite ou équivalent), agissant comme sous-traitant au sens du RGPD.{' '}
            <strong>[À COMPLÉTER : nom du prestataire une fois choisi.]</strong>
          </p>
        </div>
      </article>
    </>
  )
}

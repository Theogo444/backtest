// ============================================================================
//  PrivacyPolicy.jsx — politique de confidentialité (/confidentialite).
//  Base RGPD minimale (données email, finalité, droits, cookies, sous-traitant).
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
            via le lien présent dans chaque email. Vous pouvez également introduire une réclamation
            auprès de la CNIL.
          </p>

          <h2>Cookies et mesure d'audience</h2>
          <p>
            Le site peut utiliser des cookies de mesure d'audience. Ces outils ne sont activés
            qu'avec votre accord lorsque la réglementation l'exige.
          </p>

          <h2>Prestataire d'emailing</h2>
          <p>
            L'envoi de nos emails est confié à un prestataire spécialisé, agissant comme
            sous-traitant au sens du RGPD.
          </p>
        </div>
      </article>
    </>
  )
}

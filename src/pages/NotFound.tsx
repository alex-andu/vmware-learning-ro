import { Link } from 'react-router-dom';
import { useT } from '../lib/i18n';

export function NotFound() {
  const t = useT();
  return (
    <div className="card">
      <p>{t('notFound')}</p>
      <Link to="/" className="text-[var(--accent)] underline">{t('dashboard')}</Link>
    </div>
  );
}

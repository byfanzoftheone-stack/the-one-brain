import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../utils/AuthContext';

const NAV = [
  { href: '/',             icon: '🏡', label: 'Home'     },
  { href: '/recipes',      icon: '📖', label: 'Recipes'  },
  { href: '/memory-wall',  icon: '🌻', label: 'Memories' },
  { href: '/upload',       icon: '✚',  label: 'Add'      },
  { href: '/profile',      icon: '👤', label: 'Me'        },
];

export default function Navbar() {
  const { pathname } = useRouter();
  const { user } = useAuth();

  return (
    <nav className="bottom-nav">
      {NAV.map(({ href, icon, label }) => (
        <Link
          key={href}
          href={user || href === '/' ? href : '/login'}
          className={pathname === href ? 'active' : ''}
        >
          <span className="nav-icon">{icon}</span>
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

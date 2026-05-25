const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const Svg = ({ children, size = 24, className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={`nav-icon ${className}`.trim()}
    aria-hidden="true"
    {...stroke}
  >
    {children}
  </svg>
);

export const HomeIcon = (props) => (
  <Svg {...props}>
    <path d="M3 10.5L12 4l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z" />
  </Svg>
);

export const TasksIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </Svg>
);

export const WalletIcon = (props) => (
  <Svg {...props}>
    <path d="M4 7h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z" />
    <path d="M16 13h2" />
    <path d="M4 11h16" />
  </Svg>
);

export const UsersIcon = (props) => (
  <Svg {...props}>
    <path d="M16 19v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1" />
    <circle cx="10" cy="8" r="3" />
    <path d="M20 19v-1a3 3 0 00-2.2-2.87" />
    <path d="M16 4.13a3 3 0 010 5.74" />
  </Svg>
);

export const PackageIcon = (props) => (
  <Svg {...props}>
    <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
    <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
  </Svg>
);

export const SettingsIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </Svg>
);

export const ContactIcon = (props) => (
  <Svg {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </Svg>
);

export const GridIcon = (props) => (
  <Svg {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </Svg>
);

export const StatsIcon = (props) => (
  <Svg {...props}>
    <path d="M4 19V5M4 19h16M8 19V11M12 19V7M16 19V14" />
  </Svg>
);

export const OfferIcon = (props) => (
  <Svg {...props}>
    <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.8 5.7 21l2.3-7-6-4.6h7.6L12 2z" />
  </Svg>
);

export const WithdrawIcon = (props) => (
  <Svg {...props}>
    <path d="M12 3v12M8 11l4 4 4-4" />
    <path d="M5 19h14" />
  </Svg>
);

export const BalanceIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v10M9.5 10.5c0-1.5 1.1-2.5 2.5-2.5S14.5 9 14.5 10.5 13.4 13 12 13s-2.5 1-2.5 2.5S10.6 18 12 18" />
  </Svg>
);

export const CheckIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12l3 3 5-6" />
  </Svg>
);

export const LinkIcon = (props) => (
  <Svg {...props}>
    <path d="M10 13a4 4 0 005.66 0l2-2a4 4 0 00-5.66-5.66l-1 1" />
    <path d="M14 11a4 4 0 00-5.66 0l-2 2a4 4 0 005.66 5.66l1-1" />
  </Svg>
);

export const LockIcon = (props) => (
  <Svg {...props}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 118 0v3" />
  </Svg>
);

export const MenuIcon = (props) => (
  <Svg {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

const ICON_MAP = {
  home: HomeIcon,
  tasks: TasksIcon,
  wallet: WalletIcon,
  users: UsersIcon,
  package: PackageIcon,
  settings: SettingsIcon,
  contact: ContactIcon,
  grid: GridIcon,
  stats: StatsIcon,
  offer: OfferIcon,
  withdraw: WithdrawIcon,
  balance: BalanceIcon,
  check: CheckIcon,
  link: LinkIcon,
  lock: LockIcon,
  menu: MenuIcon,
};

export const NavIcon = ({ name, size = 24, className = '' }) => {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon size={size} className={className} />;
};

export default NavIcon;

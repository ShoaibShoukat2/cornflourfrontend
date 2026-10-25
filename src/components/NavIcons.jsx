const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
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
    <rect x="6" y="4" width="12" height="16" rx="2" />
    <path d="M9 4.5h6" />
    <path d="M9 10h6M9 14h6M9 18h4" />
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
    <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
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
    <path d="M4 16l5-5 3 3 8-8" />
    <path d="M14 6h6v6" />
  </Svg>
);

export const UpgradeIcon = (props) => (
  <Svg {...props}>
    <path d="M12 19V5" />
    <path d="M6 11l6-6 6 6" />
    <path d="M5 21h14" />
  </Svg>
);

export const BellIcon = (props) => (
  <Svg {...props}>
    <path d="M6 16V10a6 6 0 1112 0v6l1.5 2h-15L6 16z" />
    <path d="M10 19a2 2 0 004 0" />
  </Svg>
);

export const TermsIcon = (props) => (
  <Svg {...props}>
    <path d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
    <path d="M14 3v6h6M9 13h6M9 17h4" />
  </Svg>
);

export const ComplaintIcon = (props) => (
  <Svg {...props}>
    <path d="M5 6h14a1 1 0 011 1v8a1 1 0 01-1 1H9l-4 3v-3H5a1 1 0 01-1-1V7a1 1 0 011-1z" />
  </Svg>
);

export const HistoryIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v5l3 2" />
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
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="M3 10h18" />
    <path d="M7 15h4" />
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

export const UserIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="8" r="3.2" />
    <path d="M5.5 19.5v-1.2A4.8 4.8 0 0110.3 13.5h3.4a4.8 4.8 0 014.8 4.8v1.2" />
  </Svg>
);

export const ClockIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v4.5l3 2" />
  </Svg>
);

export const CoinIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 7.5v9M9.5 9.5c.6-.8 1.4-1.2 2.5-1.2 1.6 0 2.6.8 2.6 2s-1 1.8-2.6 1.8-2.6.8-2.6 2 1 2 2.6 2c1.1 0 1.9-.4 2.5-1.2" />
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
  upgrade: UpgradeIcon,
  bell: BellIcon,
  terms: TermsIcon,
  complaint: ComplaintIcon,
  history: HistoryIcon,
  withdraw: WithdrawIcon,
  balance: BalanceIcon,
  check: CheckIcon,
  link: LinkIcon,
  lock: LockIcon,
  menu: MenuIcon,
  user: UserIcon,
  clock: ClockIcon,
  coin: CoinIcon,
};

export const NavIcon = ({ name, size = 24, className = '' }) => {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon size={size} className={className} />;
};

export default NavIcon;

const UserLayout = ({ children }) => (
  <div className="neon-bg">
    <div className="neon-stars" />
    <div className="neon-orb neon-orb-purple" />
    <div className="neon-orb neon-orb-orange" />
    <div className="neon-orb neon-orb-blue" />
    <div className="neon-content">{children}</div>
  </div>
);

export default UserLayout;

export default function GroupLayout({ information }) {
    return (
      <div className="relative flex items-center text-black dark:text-white">
        {information?.name}
      </div>
    );
  }
  
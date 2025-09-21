const TableButton = ({
  onClick = () => {},
  variant = 'view',
  size = 'sm',
  disabled = false,
  className = '',
  icon: Icon,
  'aria-label': ariaLabel,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'view':
        return 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20';
      case 'edit':
        return 'text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20';
      case 'delete':
        return 'text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20';
      case 'warning':
        return 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 dark:text-gray-400 dark:hover:text-yellow-400 dark:hover:bg-yellow-900/20';
      default:
        return 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'p-1';
      case 'sm':
        return 'p-2';
      case 'md':
        return 'p-2.5';
      default:
        return 'p-2';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'xs':
        return 'w-3 h-3';
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-5 h-5';
      default:
        return 'w-4 h-4';
    }
  };

  const baseClasses =
    'rounded-md transition-colors inline-flex items-center justify-center';
  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer';

  const finalClasses = `
    ${baseClasses}
    ${getSizeClasses()}
    ${getVariantClasses()}
    ${disabledClasses}
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={finalClasses}
      aria-label={ariaLabel}
      {...props}
    >
      {Icon && <Icon className={getIconSize()} />}
    </button>
  );
};

export default TableButton;

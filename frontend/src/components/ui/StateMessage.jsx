import { AlertCircle, Search, Info, AlertTriangle } from 'lucide-react';

const StateMessage = ({ 
  title, 
  subtitle,
  description, 
  icon: Icon, 
  variant = 'default', // 'default', 'error', 'info', 'warning'
  className = '',
  children
}) => {
  const styles = {
    default: {
      iconBg: 'bg-gray-50 dark:bg-gray-900/50',
      iconColor: 'text-gray-500 dark:text-gray-400',
    },
    error: {
      iconBg: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-500 dark:text-red-400',
    },
    info: {
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-500 dark:text-blue-400',
    },
    warning: {
      iconBg: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-500 dark:text-amber-400',
    }
  };

  const style = styles[variant] || styles.default;
  
  let DefaultIcon = Search;
  if (variant === 'error') DefaultIcon = AlertCircle;
  if (variant === 'info') DefaultIcon = Info;
  if (variant === 'warning') DefaultIcon = AlertTriangle;

  const RenderIcon = Icon || DefaultIcon;

  return (
    <div className={`w-full animate-in fade-in zoom-in-95 duration-500 ${className}`}>
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6 flex items-center gap-4 border-b border-gray-100 pb-4 dark:border-gray-700">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${style.iconBg}`}>
            <RenderIcon className={`h-6 w-6 ${style.iconColor}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="mb-2">
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {description}
          </p>
        </div>
        
        {children && (
          <div className="mt-4 flex items-center justify-end">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default StateMessage;

const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div 
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${hover ? 'card-hover' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card

import './ActionButton.css';

interface Props {
  label: string;
  primary: string
  parentMethod: () => void;
}

export const ActionButton = ({ label, primary, parentMethod }: Props) => {
  return (
   <button 
    onClick={parentMethod} 
    className={`btn ${primary ? 'btn-primary' : 'btn-secondary'}`}
   >
    {label}
  </button>
  )
}
export default function NeonCheckbox({ id, name, label, checked, onChange, value }) {
  return (
    <label className="checkbox-wrapper">
      <input
        type="checkbox"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <div className="checkmark">
        <svg stroke="currentColor" fill="none" viewBox="0 0 24 24">
          <path
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="3"
            d="M20 6L9 17L4 12"
          ></path>
        </svg>
      </div>
      {label && <span className="label">{label}</span>}
    </label>
  )
}

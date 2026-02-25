import "../CSS/CompanyCard.css";

interface CompanyCardProps {
  name: string;
  experiences: number;
  type: "Product Based" | "Service Based";
  logo: string;
}

const CompanyCard = ({ name, experiences, type, logo }: CompanyCardProps) => {
  return (
    <div className="companyCard">
      <div className="logoContainer">
        <img src={logo} alt={name} />
      </div>

      <h3>{name}</h3>

      <div className="companyType">{type}</div>

      <p className="expCount">{experiences} Experiences</p>
    </div>
  );
};

export default CompanyCard;
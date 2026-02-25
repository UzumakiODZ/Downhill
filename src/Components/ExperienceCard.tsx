import "../CSS/ExperienceCard.css";

interface ExperienceCardProps {
  company: string;
  role: string;
  candidate: string;
  date: string;
  tags?: string[];
}

const ExperienceCard = ({
  company,
  role,
  candidate,
  date,
  tags = [],
}: ExperienceCardProps) => {
  return (
    <div className="experienceCard">
      <div className="cardHeader">
        <h3>{company}</h3>
        <span className="role">{role}</span>
      </div>

      <p className="candidate">
        Shared by <strong>{candidate}</strong>
      </p>

      <p className="date">{date}</p>

      <div className="tags">
        {tags.map((tag, index) => (
          <span key={index} className="tag">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ExperienceCard;
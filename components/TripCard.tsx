import { Link, useLocation } from "react-router";

const TripCard = ({id, name, location, imageUrl, tags, price}:TripCardProps) => {
    const path = useLocation().pathname;
  return (
    <Link to={}>
    <img src={imageUrl} alt={name} />
    </Link>
  );
};

export default TripCard;

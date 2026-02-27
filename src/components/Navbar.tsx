import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/" className="btn">
            Home
          </Link>
        </li>
        <li>
          <Link to="/chosen" className="btn">
            Chosen
          </Link>
        </li>
      </ul>
    </nav>
  );
}

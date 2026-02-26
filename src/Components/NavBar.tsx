import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../CSS/NavBar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHillAvalanche,
  faHouse,
  faComments,
  faChartColumn,
  faBars,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="navBar">
      <h1>
        <FontAwesomeIcon
          icon={faHillAvalanche}
          flip="horizontal"
          size="lg"
          className="logoIcon"
        />
        Downhill
      </h1>

      <div
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} />
      </div>

      <ul className={menuOpen ? "navLinks active" : "navLinks"}>
        <li>
          <Link to="/" onClick={() => setMenuOpen(false)}>
            <FontAwesomeIcon icon={faHouse} /> Home
          </Link>
        </li>

        <li>
          <Link to="/discussion" onClick={() => setMenuOpen(false)}>
            <FontAwesomeIcon icon={faComments} /> Discussion
          </Link>
        </li>

        <li>
          <Link to="/placement-stats" onClick={() => setMenuOpen(false)}>
            <FontAwesomeIcon icon={faChartColumn} /> Placement & Stats
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default NavBar;
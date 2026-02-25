import React from 'react'
import { Link } from 'react-router-dom'
import '../CSS/NavBar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faHillAvalanche,
  faHouse,
  faComments,
  faChartColumn
} from '@fortawesome/free-solid-svg-icons'

const NavBar = () => {
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

      <ul>
        <li>
          <Link to="/">
            <FontAwesomeIcon icon={faHouse} /> Home
          </Link>
        </li>

        <li>
          <Link to="/discussion">
            <FontAwesomeIcon icon={faComments} /> Discussion
          </Link>
        </li>

        <li>
          <Link to="/placement-stats">
            <FontAwesomeIcon icon={faChartColumn} /> Placement & Stats
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default NavBar
import styles from './Welcome.module.css'
import homeIcon from '../../assets/home.svg'
import buildIcon from '../../assets/build.svg'

function Welcome() {

    const heading = {
        color: "rgb(249, 115, 22)",
        position: "relative",
        bottom: "20px"
    }

    return(
        <div className={styles.background}>
            <div className={styles.civicPlatformCaption}>
                <div></div>
                SMART CIVIC PLATFORM
            </div>

            <div className={styles.heading}>
                <div>Report. Track.</div>
                <div style={heading}>Resolve.</div>
            </div>

            <div className={styles.subheading}>
                NagarSetu connects citizens and local authorities to fix civic issues — from potholes to broken streetlights — faster than ever.
            </div>

            <div className={styles.cardContainer}>
                <div className={styles.cards} id="card1">
                    <div className={styles.cardIcon}>
                        <img src={homeIcon} alt="home" height={35} width={35} />
                    </div>

                    <div className={styles.cardTitle}>
                        Citizen Portal
                    </div>

                    <div className={styles.cardText}>
                        Report issues, track progress and vote on community problems.
                    </div>

                    <div className={styles.cardEnter}>
                        Click to enter
                    </div>
                </div>

                <div className={styles.cards} id="card2">
                    <div className={styles.cardIcon}>
                        <img src={buildIcon} alt="build" height={35} width={35} />
                    </div>

                    <div className={styles.cardTitle}>
                        Authority Portal
                    </div>

                    <div className={styles.cardText}>
                        Manage assigned tasks, update status and close resolve
                    </div>

                    <div className={styles.cardEnter}>
                        Click to enter
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Welcome
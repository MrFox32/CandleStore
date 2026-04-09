import styles from './HeroSection.module.css';
import niceUIImg from '../assets/NiceUI.png';

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.heroContainer}`}>
        <div className={styles.content}>
          <h1 className={styles.title}>Створюйте атмосферу з першого погляду</h1>
          <p className={styles.subtitle}>
            Подарункові набори хендмейд свічок для тих, хто цінує естетику та затишок. Ексклюзивне пакування та незабутні аромати.
          </p>
          <a href="#showcase" className={`btn ${styles.cta}`}>ОБРАТИ ПОДАРУНОК</a>
        </div>
        <div className={styles.imageWrapper}>
          <img src={niceUIImg} alt="Естетика свічок" className={styles.image} />
          <div className={styles.imageBackdrop}></div>
        </div>
      </div>
    </section>
  );
}

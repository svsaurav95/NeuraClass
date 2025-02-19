import styles from "./About.module.css";

const AboutUs = () => {
  return (
    <section className={styles.about}>
      <h2 className={styles.sectionTitle}>About Us</h2>
      <p className={styles.aboutDescription}>
        Vigil.AI is a cutting-edge AI-powered facial recognition and crowd analysis platform.
        Our goal is to enhance security, improve monitoring, and predict risks through intelligent insights.
        Trusted by organizations worldwide, our technology offers reliable, accurate, and efficient solutions.
      </p>
    </section>
  );
};

export default AboutUs;

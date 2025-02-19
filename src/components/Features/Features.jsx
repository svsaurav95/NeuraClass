import styles from "./Features.module.css";

const Features = () => {
  return (
    <section className={styles.features}>
      <h2 className={styles.sectionTitle}>Our Features</h2>
      <div className={styles.featuresGrid}>
        <div className={styles.featureCard}>
          <h3>Face Detection</h3>
          <p>➤ Detect faces with high accuracy and extract details like age, gender, and nationality.</p>
          <p>➤ Supports real-time video feeds for continuous monitoring.</p>
        </div>
        <div className={styles.featureCard}>
          <h3>Lost and Found</h3>
          <p>➤ Upload a photo and scan large crowds to locate missing individuals.</p>
          <p>➤ Utilizes advanced AI algorithms to match facial features efficiently.</p>
        </div>
        <div className={styles.featureCard}>
          <h3>Stampede Prediction</h3>
          <p>➤ Analyze crowd behavior to identify potential stampede risks.</p>
          <p>➤ Prevents accidents through predictive alerts and safety measures.</p>
        </div>
        <div className={styles.featureCard}>
          <h3>Real-Time Monitoring</h3>
          <p>➤ Continuously track individuals across multiple camera feeds.</p>
          <p>➤ Generates instant alerts for unauthorized personnel detection.</p>
        </div>
        <div className={styles.featureCard}>
          <h3>Access Control</h3>
          <p>➤ Integrate face recognition with security systems for seamless access.</p>
          <p>➤ Enhances security by allowing only authorized individuals entry.</p>
        </div>
        <div className={styles.featureCard}>
          <h3>Behavioral Analysis</h3>
          <p>➤ Detect suspicious or unusual behavior in real-time.</p>
          <p>➤ Uses AI-driven pattern recognition to enhance security monitoring.</p>
        </div>
      </div>
    </section>
  );
};

export default Features;

import { useState } from 'react';
import styles from '../css/ContactDetail.module.css';
import ReactMapGL, { Marker } from '@goongmaps/goong-map-react';
import markerIcon from '../assets/location-pin.png'

function ContactDetail() {
  const [viewport, setViewport] = useState({
    latitude: 10.0279,
    longitude: 105.7556,
    zoom: 16,
    width: '100%',
    height: '100%',
  });

  const goongApiAccessToken = 'paFYqbaq9rbw3S9mgvKd0PWxERuKYKvFI9RnR515';

  return (
    <div className={styles.container}>
      <div className={styles.mapContainer}>
        <ReactMapGL
          className={styles.map}
          {...viewport}
          goongApiAccessToken={goongApiAccessToken}
          onViewportChange={(newViewport: any) => setViewport(newViewport)}
        >
          <Marker
            latitude={10.0279}
            longitude={105.7556}
            offsetLeft={-20}
            offsetTop={-40}
          >
            <img
              src={markerIcon}
              alt="FPT Can Tho Marker"
              style={{ width: '30px', height: '30px' }}
            />
          </Marker>
        </ReactMapGL>
      </div>

      <div className={styles.contactForm}>
        <h3>Contact Us</h3>

        <form>
          <div className={styles.groupInput}>
            <div style={{ width: '50%' }}>
              <label htmlFor="name" className={styles.lable}>Name</label>
              <input type="text" name="" id="name" className={styles.item} />
            </div>

            <div style={{ width: '50%' }}>
              <label htmlFor="email" className={styles.lable}>Email</label>
              <input type="text" name="" id="email" className={styles.item} />
            </div>
          </div>

          <label htmlFor="subject" className={styles.lable}>Subject</label>
          <input type="text" id='subject' className={styles.item} />

          <label htmlFor="message" className={styles.lable}>Message</label>
          <textarea name="" id="message" className={styles.message}></textarea>

          <div className={styles.groupBtn}>
            <button type='submit'>Send Message</button>

            <button type='reset' style={{ width: '116px' }}>Clear Form</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ContactDetail
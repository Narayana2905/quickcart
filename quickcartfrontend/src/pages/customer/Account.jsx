import ProfileForm from '../../components/ProfileForm';
import AddressSection from '../../components/AddressSection';

export default function Account() {
  return (
    <section>
      <h2>My account</h2>
      <div className="account-grid">
        <section>
          <h3>Profile</h3>
          <ProfileForm />
        </section>
        <section>
          <h3>Saved addresses</h3>
          <AddressSection />
        </section>
      </div>
    </section>
  );
}
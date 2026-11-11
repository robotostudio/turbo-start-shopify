import { AddressBook } from "@/components/account/address-book";
import { ProfileForm } from "@/components/account/profile-form";
import { loadCustomerData } from "@/lib/customer-account/load";
import { CUSTOMER_PROFILE_QUERY } from "@/lib/customer-account/queries";
import type { CustomerProfile } from "@/lib/customer-account/types";
import { getSEOMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return await getSEOMetadata({
    title: "Profile & addresses",
    description: "Manage your name and saved addresses.",
    slug: "/account/profile",
    seoNoIndex: true,
  });
}

export default async function AccountProfilePage() {
  const { customer } = await loadCustomerData<CustomerProfile>(
    CUSTOMER_PROFILE_QUERY,
    "/account/profile"
  );

  return (
    <div className="grid gap-12">
      <section aria-labelledby="profile-heading" className="grid gap-4">
        <h2 className="font-medium text-xl" id="profile-heading">
          Profile
        </h2>
        <ProfileForm
          email={customer.emailAddress?.emailAddress ?? null}
          firstName={customer.firstName}
          lastName={customer.lastName}
        />
      </section>
      <section aria-labelledby="addresses-heading" className="grid gap-4">
        <h2 className="font-medium text-xl" id="addresses-heading">
          Addresses
        </h2>
        <AddressBook
          addresses={customer.addresses.nodes}
          defaultAddressId={customer.defaultAddress?.id ?? null}
        />
      </section>
    </div>
  );
}

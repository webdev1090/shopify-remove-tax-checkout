import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Heading,
  ResourceList,
  ResourceItem,
  Avatar,
  TextStyle,
  Button,
  Select,
  Spinner
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

import {useState, useEffect} from 'react';

import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";

export default function HomePage() {
  const authenticatedFetch = useAuthenticatedFetch();
  const [selected, setSelected] = useState('unselect');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSelectChange = (value) => {
    setSelected(value);
  }

  const saveVendors = () => {
    const save_vendors = vendors.map((obj) => {
      return {'vendor_name':obj}
    });
    authenticatedFetch('/api/save-vendors', {
      method: 'POST',
      body:  JSON.stringify(save_vendors),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  const removeTax = () => {
    const data = {
      productID: 7972366876962
    }
    authenticatedFetch('/api/remove-tax', {
      method: 'POST',
      body:  JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });  
  }

  const allProduct = async () => {
    const api = await authenticatedFetch('/api/get-featuredproduct');
    const result = await api.json();
    console.log(result);
  }  

  const installWebhook = () => {
    const req = {
      topic: 'products/create,products/update',
      address: 'https://ad36-50-2-184-50.ngrok.io/api/response-hooks'     
    }
    authenticatedFetch('/api/change-taxinclude', {
      method: 'POST',
      body:  JSON.stringify(req),
      headers: {
        'Content-Type': 'application/json'
      }
    });    
  }

  const syncVendors = async () => {
    setLoading(false);
    const vendors_api = await authenticatedFetch('/api/sync-vendors');
    let vendors = await vendors_api.json();
    vendors = vendors.map((obj) => {
      return obj.vendor;
    });
    vendors = [...new Set(vendors)];

    const sync_vendors = vendors.map((obj) => {
      return {'vendor_name':obj}
    });
    setVendors(vendors);

    setLoading(true);

    authenticatedFetch('/api/save-vendors', {
      method: 'POST',
      body:  JSON.stringify([...sync_vendors]),
      headers: {
        'Content-Type': 'application/json'
      }
    });   
  }  

  useEffect(() => {
    authenticatedFetch('/api/products/get-vendors')
    .then((res) => res.json())
    .then((res) => {
        console.log(res);
        setVendors(res.map((v) => v.vendor_name));
        setLoading(true);
    });
  },[]);

  return (
    <Page narrowWidth>
      <TitleBar title="Save Vendors" 
        primaryAction={{
          content: "Remove Tax",
          onAction: () => allProduct(),
//          onAction: () => saveVendors(),
        }}
        secondaryActions={[
          {
            content: "Sync",
            onAction: () => syncVendors(),
          },
        ]} 
      />
      <Layout>
        <Layout>
          <Card sectioned title="Select Vendor">
            { loading ? 
               <ResourceList
                  resourceName={{singular: 'customer', plural: 'customers'}}
                  items={vendors}
                  renderItem={(item) => {
                    return (
                      <ResourceItem
                      >
                        <Stack>
                          <Stack.Item fill>
                            <TextStyle variation="strong">{item}</TextStyle>
                          </Stack.Item>
                          <Stack.Item>
                            <Select
                              options={[
                                {label: 'Unselect', value: 'unselect'},
                                {label: 'Select', value: 'select'},
                              ]}
                              onChange={handleSelectChange}
                              value={selected}
                            />
                          </Stack.Item>
                        </Stack>
                      </ResourceItem>
                    );
                  }}
                />
              : 
              <Spinner accessibilityLabel="Spinner example" size="large" />
            }
          </Card>
        </Layout>
      </Layout>
    </Page>
  );
}

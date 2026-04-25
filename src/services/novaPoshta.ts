import { supabase } from '../lib/supabaseClient';

export interface NPCity {
  Description: string;
  Ref: string;
  AreaDescription: string;
}

export interface NPWarehouse {
  Description: string;
  Ref: string;
  Number: string;
}

const FUNCTION_URL = 'https://qjaxsydwhrjdqbqjnovf.supabase.co/functions/v1/nova-poshta-handler';

export const novaPoshtaService = {
  async searchCities(query: string): Promise<NPCity[]> {
    if (query.length < 2) return [];
    
    const { data, error } = await supabase.functions.invoke('nova-poshta-handler', {
      body: { action: 'searchCities', params: { query } }
    });

    if (error) throw error;
    return data.data || [];
  },

  async getWarehouses(cityRef: string, query: string = ''): Promise<NPWarehouse[]> {
    const { data, error } = await supabase.functions.invoke('nova-poshta-handler', {
      body: { action: 'getWarehouses', params: { cityRef, query } }
    });

    if (error) throw error;
    return data.data || [];
  },

  async calculateCost(cityRecipient: string, weight: number, cost: number): Promise<number | null> {
    const { data, error } = await supabase.functions.invoke('nova-poshta-handler', {
      body: { action: 'calculateCost', params: { cityRecipient, weight, cost } }
    });

    if (error) throw error;
    if (data.success && data.data && data.data[0]) {
      return data.data[0].Cost;
    }
    return null;
  },

  async createDocument(params: any) {
    const { data, error } = await supabase.functions.invoke('nova-poshta-handler', {
      body: { action: 'createDocument', params }
    });

    if (error) throw error;
    return data;
  }
};

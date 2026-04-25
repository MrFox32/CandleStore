import React, { useState, useEffect, useCallback } from 'react';
import { novaPoshtaService, NPCity, NPWarehouse } from '../services/novaPoshta';
import styles from './NovaPoshtaSelects.module.css';

interface Props {
  onCityChange: (city: NPCity | null) => void;
  onWarehouseChange: (warehouse: NPWarehouse | null) => void;
  initialCity?: string;
  initialWarehouse?: string;
}

export const NovaPoshtaSelects: React.FC<Props> = ({ 
  onCityChange, 
  onWarehouseChange,
}) => {
  const [cities, setCities] = useState<NPCity[]>([]);
  const [cityQuery, setCityQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<NPCity | null>(null);
  const [warehouses, setWarehouses] = useState<NPWarehouse[]>([]);
  const [warehouseQuery, setWarehouseQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<NPWarehouse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false);

  // Search Cities
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (cityQuery.length >= 2 && !selectedCity) {
        setIsLoading(true);
        try {
          const res = await novaPoshtaService.searchCities(cityQuery);
          setCities(res);
          setShowCityDropdown(true);
        } catch (err) {
          console.error('Failed to fetch cities', err);
        } finally {
          setIsLoading(false);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [cityQuery, selectedCity]);

  // Fetch Warehouses when City is selected
  useEffect(() => {
    if (selectedCity) {
      const fetchWarehouses = async () => {
        setIsLoading(true);
        try {
          const res = await novaPoshtaService.getWarehouses(selectedCity.Ref, warehouseQuery);
          setWarehouses(res);
        } catch (err) {
          console.error('Failed to fetch warehouses', err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchWarehouses();
    } else {
      setWarehouses([]);
    }
  }, [selectedCity, warehouseQuery]);

  const handleCitySelect = (city: NPCity) => {
    setSelectedCity(city);
    setCityQuery(city.Description);
    setShowCityDropdown(false);
    onCityChange(city);
    // Reset warehouse
    setSelectedWarehouse(null);
    setWarehouseQuery('');
    onWarehouseChange(null);
  };

  const handleWarehouseSelect = (warehouse: NPWarehouse) => {
    setSelectedWarehouse(warehouse);
    setWarehouseQuery(warehouse.Description);
    setShowWarehouseDropdown(false);
    onWarehouseChange(warehouse);
  };

  return (
    <div className={styles.container}>
      <div className={styles.fieldGroup}>
        <label>Місто</label>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            placeholder="Введіть назву міста..."
            value={cityQuery}
            onChange={(e) => {
              setCityQuery(e.target.value);
              setSelectedCity(null);
            }}
            onFocus={() => setShowCityDropdown(true)}
            onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
            className={styles.input}
          />
          {isLoading && <div className={styles.loader} />}
          
          {showCityDropdown && cities.length > 0 && (
            <div className={styles.dropdown}>
              {cities.map((city) => (
                <div 
                  key={city.Ref} 
                  className={styles.option}
                  onClick={() => handleCitySelect(city)}
                >
                  {city.Description} ({city.AreaDescription})
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`${styles.fieldGroup} ${!selectedCity ? styles.disabled : ''}`}>
        <label>Відділення</label>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            placeholder={selectedCity ? "Оберіть відділення..." : "Спочатку оберіть місто"}
            value={warehouseQuery}
            onChange={(e) => {
              setWarehouseQuery(e.target.value);
              setSelectedWarehouse(null);
            }}
            disabled={!selectedCity}
            onFocus={() => setShowWarehouseDropdown(true)}
            onBlur={() => setTimeout(() => setShowWarehouseDropdown(false), 200)}
            className={styles.input}
          />
          
          {showWarehouseDropdown && warehouses.length > 0 && (
            <div className={styles.dropdown}>
              {warehouses.map((w) => (
                <div 
                  key={w.Ref} 
                  className={styles.option}
                  onClick={() => handleWarehouseSelect(w)}
                >
                  #{w.Number} - {w.Description}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

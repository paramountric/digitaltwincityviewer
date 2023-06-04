import { useState, useEffect, useMemo } from 'react';
import { Observable } from '../lib/Observable';

export type FilterCategories = {
  [propertyKey: string]: {
    [propertyValue: string]: {
      [uuid: string]: any; // uuid to feature map
    };
  };
};
const filterCategoriesStore = new Observable<FilterCategories>({});

const useFilterCategories = () => {
  const [filterCategories, setFilterCategories] = useState<FilterCategories>(
    filterCategoriesStore.get()
  );

  useEffect(() => {
    return filterCategoriesStore.subscribe(setFilterCategories);
  }, []);

  useEffect(() => {}, [filterCategories]);

  const actions = useMemo(() => {
    return {
      setFilterCategories: (filterCategories: FilterCategories) =>
        filterCategoriesStore.set(filterCategories),
    };
  }, []);

  return {
    state: filterCategories,
    actions,
  };
};

export { useFilterCategories };

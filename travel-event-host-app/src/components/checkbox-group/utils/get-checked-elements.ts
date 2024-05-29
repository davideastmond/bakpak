/**
 * This function gets the checked elements from an object whose values are booleans
 */
export function getCheckedElements<T>(checkboxState: { [key in string]: boolean }): T[] {
  // This gets only the checked elements from the checkbox state
  return Object.entries(checkboxState).reduce((acc: T[], [element, checked]) => {
    if (checked) acc.push(element as T);
    return acc;
  }, []);
}

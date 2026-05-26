export const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

/**
 * Validates a transition between two ticket statuses.
 * Allowed transitions are exactly one step forward or one step backward.
 * 
 * @param {string} currentStatus 
 * @param {string} newStatus 
 * @returns {object} { valid: boolean, message?: string }
 */
export const isValidTransition = (currentStatus, newStatus) => {
  if (currentStatus === newStatus) {
    return { valid: true };
  }

  const currentIndex = STATUSES.indexOf(currentStatus);
  const newIndex = STATUSES.indexOf(newStatus);

  if (currentIndex === -1 || newIndex === -1) {
    return {
      valid: false,
      message: `Invalid status: ${currentStatus} or ${newStatus}`,
    };
  }

  const diff = newIndex - currentIndex;

  if (diff === 1) {
    return { valid: true };
  }

  if (diff === -1) {
    return { valid: true };
  }

  return {
    valid: false,
    message: `Invalid transition from '${currentStatus}' to '${newStatus}'. Only single-step transitions forward or backward are allowed.`,
  };
};

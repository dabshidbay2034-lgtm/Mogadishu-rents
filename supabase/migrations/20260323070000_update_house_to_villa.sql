-- Update property_type enum to change 'house' to 'villa'
-- First, we need to update any existing records that use 'house' to 'villa'
UPDATE properties SET type = 'villa' WHERE type = 'house';

-- Then update the enum type
ALTER TYPE property_type RENAME VALUE 'house' TO 'villa';
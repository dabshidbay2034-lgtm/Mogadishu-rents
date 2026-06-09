-- Add furnished column to properties table
ALTER TABLE public.properties 
ADD COLUMN is_furnished boolean DEFAULT false;
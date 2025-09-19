-- Update the handle_new_user function to properly handle all profile fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role, phone, emergency_contact_name, emergency_contact_phone, country)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'tourist'),
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'emergency_contact_name',
    NEW.raw_user_meta_data ->> 'emergency_contact_phone',
    NEW.raw_user_meta_data ->> 'country'
  );
  RETURN NEW;
END;
$function$;

-- Enable realtime for all tables so dashboard updates work properly
ALTER TABLE public.emergency_alerts REPLICA IDENTITY FULL;
ALTER TABLE public.tourist_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tourist_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
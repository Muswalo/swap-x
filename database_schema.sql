-- Function to process swap matches and create notifications
CREATE OR REPLACE FUNCTION process_swap_matches()
RETURNS TABLE(
  processed_count INTEGER,
  notifications_created INTEGER
) AS $$
DECLARE
  v_queue_record RECORD;
  v_source_swap RECORD;
  v_matched_swap RECORD;
  v_device_token TEXT;
  v_processed_count INTEGER := 0;
  v_notifications_created INTEGER := 0;
BEGIN
  -- Get the oldest unprocessed swap from the queue
  SELECT * INTO v_queue_record
  FROM swap_identification_queue
  WHERE processed = FALSE
  ORDER BY created_at ASC
  LIMIT 1;

  -- Exit if no unprocessed swaps found
  IF v_queue_record IS NULL THEN
    RETURN QUERY SELECT 0, 0;
    RETURN;
  END IF;

  -- Get the source swap details
  SELECT * INTO v_source_swap
  FROM swaps
  WHERE id = v_queue_record.swap_id
    AND status = 'active';

  -- Exit if source swap not found or not active
  IF v_source_swap IS NULL THEN
    -- Mark as processed even if swap is invalid
    UPDATE swap_identification_queue
    SET processed = TRUE,
        processed_at = NOW()
    WHERE id = v_queue_record.id;
    
    RETURN QUERY SELECT 1, 0;
    RETURN;
  END IF;

  -- Find matching swaps where:
  -- 1. Their current location is where the source user wants to go
  -- 2. Their desired location is where the source user currently is
  -- 3. The swap is active
  -- 4. It's not the same user
  FOR v_matched_swap IN
    SELECT s.*
    FROM swaps s
    WHERE s.id != v_source_swap.id
      AND s.user_id != v_source_swap.user_id
      AND s.status = 'active'
      -- Match: their current location = source's desired location
      AND s.current_district = v_source_swap.desired_district
      AND (v_source_swap.desired_ministry IS NULL OR s.current_ministry = v_source_swap.desired_ministry)
      AND s.current_area_type = v_source_swap.desired_area_type
      -- Match: their desired location = source's current location
      AND s.desired_district = v_source_swap.current_district
      AND (s.desired_ministry IS NULL OR s.desired_ministry = v_source_swap.current_ministry)
      AND s.desired_area_type = v_source_swap.current_area_type
  LOOP
    -- Get device tokens for the matched user
    FOR v_device_token IN
      SELECT expo_push_token
      FROM notification_tokens
      WHERE user_id = v_matched_swap.user_id
    LOOP
      -- Create notification for the matched user
      INSERT INTO notifications (
        user_id,
        notification_type,
        status,
        title,
        body,
        data,
        swap_id,
        from_user_id,
        device_token,
        delivery_channel,
        priority,
        scheduled_at
      ) VALUES (
        v_matched_swap.user_id,
        'swap_match',
        'pending',
        'Potential Swap Match Found!',
        format('A swap match has been found between %s, %s and %s, %s',
               v_source_swap.current_district,
               v_source_swap.current_ministry,
               v_matched_swap.current_district,
               v_matched_swap.current_ministry),
        jsonb_build_object(
          'match_swap_id', v_source_swap.id,
          'matched_user_district', v_source_swap.current_district,
          'matched_user_ministry', v_source_swap.current_ministry,
          'your_district', v_matched_swap.current_district,
          'your_ministry', v_matched_swap.current_ministry
        ),
        v_matched_swap.id,
        v_source_swap.user_id,
        v_device_token,
        'push',
        'high',
        NOW()
      );
      
      v_notifications_created := v_notifications_created + 1;
    END LOOP;

    -- Also notify the source user about this match
    FOR v_device_token IN
      SELECT expo_push_token
      FROM notification_tokens
      WHERE user_id = v_source_swap.user_id
    LOOP
      INSERT INTO notifications (
        user_id,
        notification_type,
        status,
        title,
        body,
        data,
        swap_id,
        from_user_id,
        device_token,
        delivery_channel,
        priority,
        scheduled_at
      ) VALUES (
        v_source_swap.user_id,
        'swap_match',
        'pending',
        'Potential Swap Match Found!',
        format('A swap match has been found between %s, %s and %s, %s',
               v_source_swap.current_district,
               v_source_swap.current_ministry,
               v_matched_swap.current_district,
               v_matched_swap.current_ministry),
        jsonb_build_object(
          'match_swap_id', v_matched_swap.id,
          'matched_user_district', v_matched_swap.current_district,
          'matched_user_ministry', v_matched_swap.current_ministry,
          'your_district', v_source_swap.current_district,
          'your_ministry', v_source_swap.current_ministry
        ),
        v_source_swap.id,
        v_matched_swap.user_id,
        v_device_token,
        'push',
        'high',
        NOW()
      );
      
      v_notifications_created := v_notifications_created + 1;
    END LOOP;
  END LOOP;

  -- Mark the queue record as processed
  UPDATE swap_identification_queue
  SET processed = TRUE,
      processed_at = NOW()
  WHERE id = v_queue_record.id;

  v_processed_count := 1;

  -- Return summary
  RETURN QUERY SELECT v_processed_count, v_notifications_created;
END;
$$ LANGUAGE plpgsql;

-- Example usage for cron job:
-- SELECT * FROM process_swap_matches();
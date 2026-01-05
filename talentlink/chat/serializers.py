from rest_framework import serializers
from .models import Conversation, Message, MessageReadReceipt
from contracts.serializers import ContractSerializer

class ConversationSerializer(serializers.ModelSerializer):
    contract_details = ContractSerializer(source='contract', read_only=True)
    participants_names = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'contract', 'contract_details', 'participants',
            'participants_names', 'is_active', 'unread_count',
            'last_message', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_participants_names(self, obj):
        return [user.get_full_name() or user.username for user in obj.participants.all()]
    
    def get_unread_count(self, obj):
        user = self.context['request'].user
        return obj.messages.filter(is_read=False).exclude(sender=user).count()
    
    def get_last_message(self, obj):
        last_msg = obj.messages.first()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    is_mine = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'sender_name', 'sender_username',
            'message_type', 'text', 'file_url', 'file_name',
            'contract_action', 'contract_data', 'is_read', 'read_at',
            'is_mine', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'sender']
    
    def get_is_mine(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.sender == request.user
        return False
    
    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)

class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['text', 'message_type', 'file_url', 'file_name', 'contract_action', 'contract_data']

class MessageReadReceiptSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = MessageReadReceipt
        fields = ['id', 'user', 'user_name', 'read_at']